import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  standalone: false,
})
export class QuestionFormComponent implements OnInit {
  @Output() questionSubmit = new EventEmitter<any>();
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  selectedImages: File[] = [];
  imagesPreviews: string[] = [];
  selectedTags: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      body: ['', [Validators.required, Validators.minLength(20)]],
      tags: [[], Validators.required]
    });
  }

  ngOnInit() {}

  get titleControl(): FormControl {
    return this.form.get('title') as FormControl;
  }

  get bodyControl(): FormControl {
    return this.form.get('body') as FormControl;
  }

  get tagsControl(): FormControl {
    return this.form.get('tags') as FormControl;
  }

  triggerImageInput() {
    this.imageInput.nativeElement.click();
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      
      // Limitar a 5 imágenes máximo
      if (this.selectedImages.length + files.length > 5) {
        alert('Máximo 5 imágenes permitidas');
        return;
      }

      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedImages.push(file);
          
          // Crear preview
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagesPreviews.push(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagesPreviews.splice(index, 1);
  }

  onTagsChange(tags: string[]) {
    // Enforce 1..2 selection at form level as well
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

  submit() {
    if (this.form.valid) {
      const formData = {
        title: this.titleControl.value,
        body: this.bodyControl.value,
        tags: this.selectedTags,
        images: this.selectedImages
      };
      this.questionSubmit.emit(formData);
    } else {
      // Marcar todos como touched para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

}
