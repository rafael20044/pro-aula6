import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { IImage } from 'src/app/interfaces/iimage';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';
import { StorageService } from './storage-service';
import { IQuestionBytitle } from 'src/app/interfaces/iquestionbytitle';

import { ContentModerationService } from 'src/app/core/services/content-moderation.service';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(
    private readonly storageService: StorageService,
    private readonly moderationService: ContentModerationService,
    private readonly toastService: ToastService
  ) { }

  async findAllQuestions() {
    const { data, error } = await Supabase.rpc('get_all_questions');
    if (error) {
      console.log(error);
      return [];
    }
    return data as IQuestionHome[];
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

    console.log('Pregunta creada correctamente con ID:', questionId);
    return questionId;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const { error } = await Supabase
      .from(Const.TB_QUESTIONS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return false;
    }
    return true;
  }
}
