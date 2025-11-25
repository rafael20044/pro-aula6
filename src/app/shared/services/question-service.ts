import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { IImage } from 'src/app/interfaces/iimage';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';
import { StorageService } from './storage-service';
import { PhotoService } from './photo-service';
import { IQuestionBytitle } from 'src/app/interfaces/iquestionbytitle';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(
    private readonly storageService: StorageService,
    private readonly photoService: PhotoService
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


  async findByIdUser(id:number){
    const {data, error} = await Supabase.rpc('get_questions_by_user', {p_user_id: id});
    if (error) {
      console.log(error);
      return [];
    }
    return data as IQuestionHome[];
  }

  async createQuestion(question: any, tags: [], images: IImage[]) {
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
          .single();

        if (tagSearchError && tagSearchError.code !== 'PGRST116') {
          console.error(`Error buscando etiqueta '${tag}':`, tagSearchError);
          continue;
        }

        let tagId = existingTag?.id;

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
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return false;
    }
    return true;
  }

  /**
   * Obtiene las imágenes de una pregunta con URLs resueltas
   * @param questionId - ID de la pregunta
   * @returns Array de URLs firmadas de las imágenes
   */
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

  /**
   * Obtiene las imágenes de múltiples preguntas con URLs resueltas
   * @param questionIds - Array de IDs de preguntas
   * @returns Map de questionId -> array de URLs de imágenes
   */
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
}

