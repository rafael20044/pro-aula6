import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { IImage } from 'src/app/interfaces/iimage';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';
import { StorageService } from './storage-service';
import { PhotoService } from './photo-service';
import { IQuestionBytitle } from 'src/app/interfaces/iquestionbytitle';

import { ContentModerationService } from 'src/app/core/services/content-moderation.service';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionsCache: IQuestionHome[] = [];
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minuto

  constructor(
    private readonly storageService: StorageService,
    private readonly photoService: PhotoService,
    private readonly moderationService: ContentModerationService,
    private readonly toastService: ToastService
  ) { }

  async findAllQuestions(forceRefresh: boolean = false) {
    const now = Date.now();
    
    // Usar caché si existe y no ha expirado
    if (!forceRefresh && this.questionsCache.length > 0 && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.questionsCache;
    }

    const { data, error } = await Supabase.rpc('get_all_questions');
    if (error) {
      console.log(error);
      return this.questionsCache.length > 0 ? this.questionsCache : [];
    }
    
    this.questionsCache = data as IQuestionHome[];
    this.cacheTimestamp = now;
    return this.questionsCache;
  }

  async findQuestionsPaginated(page: number = 0, pageSize: number = 10) {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await Supabase
      .from(Const.TB_QUESTIONS)
      .select('*, users!inner(name, last_name, photo)')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) {
      console.error('Error loading paginated questions:', error);
      return [];
    }

    return data || [];
  }

  clearCache() {
    this.questionsCache = [];
    this.cacheTimestamp = 0;
  }

  async getQuestionDetails(questionId: number): Promise<IQuestionDetails | null> {
    const { data, error } = await Supabase.rpc('get_question_details', { question_id_param: questionId }).single();

    if (error) {
      console.error('Error al obtener la pregunta:', error);
      return null;
    }
    return data as IQuestionDetails;
  }


  async findByTitle(title: string) {
    const { data, error } = await Supabase.rpc('search_questions_by_title', { search_text: title });
    if (error) {
      console.log(error);
      return [];
    }
    return data as IQuestionBytitle[]
  }


  async findByIdUser(id:number){
    const {data, error} = await Supabase.rpc('get_questions_by_user', {p_user_id: id});
    if (error) {
      console.log(error);
      return [];
    }
    return data as IQuestionHome[];
  }

  async createQuestion(question: any, tags: [], images: IImage[]) {
    // Validate content with AI
    this.toastService.show('Verificando contenido con IA...', 2000, 'top', 'success');

    const titleValidation = await this.moderationService.validateContent(question.title);
    if (titleValidation.error) {
      this.toastService.show('Advertencia: No se pudo verificar el título con IA', 3000, 'top', 'warning');
    } else if (!titleValidation.valid) {
      this.toastService.show(`Título inapropiado: ${titleValidation.reason}`, 4000, 'top', 'danger');
      throw new Error(`El título contiene contenido inapropiado: ${titleValidation.reason}`);
    }

    const bodyValidation = await this.moderationService.validateContent(question.body);
    if (bodyValidation.error) {
      this.toastService.show('Advertencia: No se pudo verificar el cuerpo con IA', 3000, 'top', 'warning');
    } else if (!bodyValidation.valid) {
      this.toastService.show(`Descripción inapropiada: ${bodyValidation.reason}`, 4000, 'top', 'danger');
      throw new Error(`El cuerpo de la pregunta contiene contenido inapropiado: ${bodyValidation.reason}`);
    }

    const { data: questionData, error: questionError } = await Supabase
      .from(Const.TB_QUESTIONS)
      .insert(question)
      .select('id')
      .single();

    if (questionError || !questionData) {
      console.error('Error creando la pregunta:', questionError);
      return;
    }

    const questionId = questionData.id;

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        const { data: existingTag, error: tagSearchError } = await Supabase
          .from(Const.TB_TAGS)
          .select('id')
          .eq('name', tag)
          .maybeSingle();

        if (tagSearchError) {
          console.error(`Error buscando etiqueta '${tag}':`, tagSearchError);
          continue;
        }

        let tagId = existingTag?.id;

        if (!tagId) {
          // Create tag if it doesn't exist
          const { data: newTag, error: createTagError } = await Supabase
            .from(Const.TB_TAGS)
            .insert({
              name: tag,
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (createTagError) {
            console.error(`Error creando etiqueta '${tag}':`, createTagError);
            continue;
          }
          tagId = newTag.id;
        }

        // Asociar la etiqueta con la pregunta
        const { error: linkError } = await Supabase
          .from(Const.TB_TAGS_QUESTIONS)
          .insert({ tag_id: tagId, question_id: questionId });

        if (linkError) {
          console.error(`Error vinculando etiqueta '${tag}' con la pregunta:`, linkError);
        }
      }
    }

    // Insertar imágenes
    if (images && images.length > 0) {
      const uploadedImages: any[] = [];

      for (const img of images) {
        try {
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
          const folder = `questions/${questionId}`;
          const bucket = Const.BUCKET;

          const uploaded = await this.storageService.upload(
            bucket,
            folder,
            fileName,
            img.data,
            img.mimeType
          );

          if (uploaded) {
            uploadedImages.push({
              question_id: questionId,
              image_url: uploaded.url,
              path: uploaded.path
            });
          }
        } catch (err) {
          console.error('Error subiendo imagen:', err);
        }
      }

      if (uploadedImages.length > 0) {
        const { error: imgError } = await Supabase
          .from(Const.TB_IMAGES)
          .insert(uploadedImages);

        if (imgError) {
          console.error('Error insertando imágenes en BD:', imgError);
        }
      }
    }
    return questionId;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const { error } = await Supabase
      .from(Const.TB_QUESTIONS)
      .update({status: 'DELETE'})
      .eq('id', id);
    if (error) {
      console.error('Error deleting question:', error);
      return false;
    }
    return true;
  }

  async getQuestionImages(questionId: number): Promise<string[]> {
    const { data, error } = await Supabase
      .from(Const.TB_IMAGES)
      .select('image_url, path')
      .eq('question_id', questionId);

    if (error || !data) {
      console.error('Error fetching question images:', error);
      return [];
    }

    return this.photoService.resolveImageUrls(data);
  }

  async getMultipleQuestionImages(questionIds: number[]): Promise<Map<number, string[]>> {
    const result = new Map<number, string[]>();
    
    if (questionIds.length === 0) return result;

    const { data, error } = await Supabase
      .from(Const.TB_IMAGES)
      .select('question_id, image_url, path')
      .in('question_id', questionIds);

    if (error || !data) {
      console.error('Error fetching multiple question images:', error);
      return result;
    }

    // Agrupar por question_id
    const grouped = new Map<number, Array<{ image_url?: string | null, path?: string | null }>>();
    
    for (const img of data) {
      if (!grouped.has(img.question_id)) {
        grouped.set(img.question_id, []);
      }
      grouped.get(img.question_id)!.push({ image_url: img.image_url, path: img.path });
    }

    // Resolver URLs para cada grupo
    for (const [questionId, images] of grouped.entries()) {
      const urls = await this.photoService.resolveImageUrls(images);
      result.set(questionId, urls);
    }

    return result;
  }

  async updateQuestion(questionId: number, updateData: any, tags: string[], newImages: IImage[], imagesToDelete: number[] = []) {
    try {
      // Eliminar imágenes marcadas para borrar
      if (imagesToDelete && imagesToDelete.length > 0) {
        // Obtener paths de las imágenes a eliminar
        const { data: imagesToDeleteData } = await Supabase
          .from(Const.TB_IMAGES)
          .select('path')
          .in('id', imagesToDelete);

        if (imagesToDeleteData && imagesToDeleteData.length > 0) {
          // Eliminar archivos del storage
          const pathsToDelete = imagesToDeleteData
            .map(img => img.path)
            .filter(path => path != null);

          if (pathsToDelete.length > 0) {
            try {
              await Supabase.storage.from(Const.BUCKET).remove(pathsToDelete);
            } catch (err) {
              console.error('Error deleting images from storage:', err);
            }
          }
        }

        // Eliminar registros de la BD
        await Supabase
          .from(Const.TB_IMAGES)
          .delete()
          .in('id', imagesToDelete);
      }

      // Actualizar pregunta
      const { error: updateError } = await Supabase
        .from(Const.TB_QUESTIONS)
        .update({
          title: updateData.title,
          body: updateData.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (updateError) {
        console.error('Error updating question:', updateError);
        return false;
      }

      // Actualizar tags si cambiaron
      if (tags && tags.length > 0) {
        // Eliminar tags anteriores
        await Supabase
          .from(Const.TB_TAGS_QUESTIONS)
          .delete()
          .eq('question_id', questionId);

        // Agregar nuevos tags
        for (const tag of tags) {
          const { data: existingTag } = await Supabase
            .from(Const.TB_TAGS)
            .select('id')
            .eq('name', tag)
            .maybeSingle();

          let tagId = existingTag?.id;

          if (!tagId) {
            const { data: newTag } = await Supabase
              .from(Const.TB_TAGS)
              .insert({
                name: tag,
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single();
            tagId = newTag?.id;
          }

          if (tagId) {
            await Supabase
              .from(Const.TB_TAGS_QUESTIONS)
              .insert({ tag_id: tagId, question_id: questionId });
          }
        }
      }

      // Agregar nuevas imágenes si hay
      if (newImages && newImages.length > 0) {
        const uploadedImages: any[] = [];

        for (const img of newImages) {
          try {
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
            const folder = `questions/${questionId}`;
            const bucket = Const.BUCKET;

            const uploaded = await this.storageService.upload(
              bucket,
              folder,
              fileName,
              img.data,
              img.mimeType
            );

            if (uploaded) {
              uploadedImages.push({
                question_id: questionId,
                image_url: uploaded.url,
                path: uploaded.path
              });
            }
          } catch (err) {
            console.error('Error uploading new image:', err);
          }
        }

        if (uploadedImages.length > 0) {
          await Supabase
            .from(Const.TB_IMAGES)
            .insert(uploadedImages);
        }
      }

      return true;
    } catch (err) {
      console.error('Error in updateQuestion:', err);
      return false;
    }
  }
}

