import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { IImage } from 'src/app/interfaces/iimage';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';
import { StorageService } from './storage-service';
import { IQuestionBytitle } from 'src/app/interfaces/iquestionbytitle';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private readonly storageService:StorageService) { }

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


  async findByTitle(title:string){
    const {data, error} = await Supabase.rpc('search_questions_by_title', {search_text: title});
    if (error) {
      console.log(error);
      return [];
    }
    return data as IQuestionBytitle[]
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

    console.log('Pregunta creada correctamente con ID:', questionId);
    return questionId;
  }
}

