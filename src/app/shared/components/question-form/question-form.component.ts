import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FilePickerService } from 'src/app/core/services/file-picker-service';
import { IImage } from 'src/app/interfaces/iimage';
import { ToastService } from '../../services/toast-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { QuestionService } from '../../services/question-service';
import { IQuestioCreate } from 'src/app/interfaces/iquestioncreate';
import { Const } from 'src/app/const/const';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage-service';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  standalone: false,
})
export class QuestionFormComponent implements OnInit {
  @Output() questionSubmit = new EventEmitter<any>();
  @Input() isEditing: boolean = false;
  @Input() existingQuestion: IQuestionHome | null = null;

  form: FormGroup;
  imagesPreviews: string[] = [];
  pickedImages: IImage[] = [];
  selectedTags: string[] = [];
  readonly maxImages = 3;
  existingImageUrls: string[] = []; // URLs de imágenes existentes
  existingImages: Array<{id?: number, path: string, url: string}> = []; // Imágenes existentes con metadata
  imagesToDelete: number[] = []; // IDs de imágenes a eliminar
  submitting: boolean = false;

  constructor(
      private fb: FormBuilder, 
      private filePicker: FilePickerService, 
      private toast:ToastService,
      private local:LocalStorageService,
      private question:QuestionService,
      private route:Router,
      private storageService: StorageService
    ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      body: ['', [Validators.required, Validators.minLength(20)]],
      tags: [[], Validators.required]
    });
  }

  async ngOnInit() {
    if (this.isEditing && this.existingQuestion) {
      await this.loadExistingQuestion();
    }
  }

  private async loadExistingQuestion() {
    if (!this.existingQuestion) return;

    // Pre-rellenar formulario
    this.form.patchValue({
      title: this.existingQuestion.title,
      body: this.existingQuestion.body,
      tags: this.existingQuestion.tags || []
    });

    this.selectedTags = this.existingQuestion.tags || [];
    this.tagsControl.setValue(this.selectedTags);

    // Cargar imágenes existentes
    if (this.existingQuestion.images && this.existingQuestion.images.length > 0) {
      for (const img of this.existingQuestion.images) {
        try {
          const path = img.path || img.image_url;
          const imageId = (img as any).id;
          if (!path) continue;

          let imageUrl: string;
          // Si ya es URL completa, usarla directamente
          if (typeof path === 'string' && path.startsWith('http')) {
            imageUrl = path;
          } else {
            // Obtener URL firmada
            const signed = await this.storageService.getSignUrl(Const.BUCKET, path);
            if (!signed?.url) continue;
            imageUrl = signed.url;
          }

          // Guardar metadata de imagen existente
          this.existingImages.push({
            id: imageId,
            path: path,
            url: imageUrl
          });
          this.imagesPreviews.push(imageUrl);
        } catch (err) {
          console.error('Error loading existing image:', err);
        }
      }
    }
  }

  get titleControl(): FormControl {
    return this.form.get('title') as FormControl;
  }

  get bodyControl(): FormControl {
    return this.form.get('body') as FormControl;
  }

  get tagsControl(): FormControl {
    return this.form.get('tags') as FormControl;
  }

  async triggerGallery() {
    const totalImages = this.existingImages.length + this.pickedImages.length;
    if (totalImages >= this.maxImages) return;
    
    const img = await this.filePicker.pickImage();
    if (img) {
      if (totalImages < this.maxImages) {
        this.pickedImages.push(img);
        if (img.previewUrl) this.imagesPreviews.push(img.previewUrl);
      }
    }
  }

  removeImage(index: number) {
    // Determinar si es imagen existente o nueva
    if (index < this.existingImages.length) {
      // Es imagen existente - marcar para eliminar
      const imageToDelete = this.existingImages[index];
      if (imageToDelete.id) {
        this.imagesToDelete.push(imageToDelete.id);
      }
      this.existingImages.splice(index, 1);
    } else {
      // Es imagen nueva - solo quitar del array
      const newImageIndex = index - this.existingImages.length;
      this.pickedImages.splice(newImageIndex, 1);
    }
    this.imagesPreviews.splice(index, 1);
  }

  onTagsChange(tags: string[]) {

    this.selectedTags = Array.isArray(tags) ? tags.slice(0, 2) : [];
    this.tagsControl.setValue(this.selectedTags);
    this.tagsControl.markAsTouched();
    if (this.selectedTags.length === 0) {
      this.tagsControl.setErrors({ required: true });
    } else if (this.selectedTags.length > 2) {
      this.tagsControl.setErrors({ max: true });
    } else {
      this.tagsControl.setErrors(null);
    }
  }

  async submit() {
    if (!this.form.valid) {
      this.toast.show('Complete los campos obligatorio', 1500, 'bottom', 'warning');
      return;
    }
    
    if (this.submitting) return; // Evitar doble submit
    this.submitting = true;
    
    const id = this.local.get(Const.USER_ID) as number;
    
    try {
      if (this.isEditing && this.existingQuestion) {
        // Modo edición
        const updateData = {
          title: this.form.value.title,
          body: this.form.value.body,
        };
        
        const success = await this.question.updateQuestion(
          this.existingQuestion.question_id,
          updateData,
          this.form.value.tags,
          this.pickedImages, // Nuevas imágenes
          this.imagesToDelete // IDs de imágenes a eliminar
        );
        
        if (success) {
          this.toast.show('¡Pregunta actualizada con éxito!');
          this.questionSubmit.emit({ updated: true, questionId: this.existingQuestion.question_id });
          // Navegar a home y forzar refresh
          await this.route.navigate(['/user/home'], { 
            queryParams: { refresh: Date.now() } 
          });
        } else {
          this.toast.showError('Error al actualizar la pregunta');
          this.submitting = false;
        }
      } else {
        // Modo creación
        const question:IQuestioCreate = {
          user_id: id,
          body: this.form.value.body,
          title: this.form.value.title,
        };
        const questionId = await this.question.createQuestion(question, this.form.value.tags, this.pickedImages);
        if (questionId) {
          this.toast.show('¡Pregunta creada con exito!');
          await this.route.navigate(['/user/home'], { 
            queryParams: { refresh: Date.now() } 
          });
        } else {
          this.submitting = false;
        }
      }
    } catch (error) {
      console.error('Error in submit:', error);
      this.toast.showError('Error al procesar la solicitud');
      this.submitting = false;
    }
  }

}
