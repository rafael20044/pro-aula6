import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FilePickerService } from 'src/app/core/services/file-picker-service';
import { IImage } from 'src/app/interfaces/iimage';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  standalone: false,
})
export class QuestionFormComponent implements OnInit {
  @Output() questionSubmit = new EventEmitter<any>();

  form: FormGroup;
  imagesPreviews: string[] = [];
  pickedImages: IImage[] = [];
  selectedTags: string[] = [];
  readonly maxImages = 3;

  constructor(private fb: FormBuilder, private filePicker: FilePickerService) {
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

  // Legacy input methods removed to avoid native file control

  // Open gallery via FilePickerService, append up to 5 images
  async triggerGallery() {
    if (this.pickedImages.length >= this.maxImages) return;
    const img = await this.filePicker.pickImage();
    if (img) {
      if (this.pickedImages.length < this.maxImages) {
        this.pickedImages.push(img);
        if (img.previewUrl) this.imagesPreviews.push(img.previewUrl);
      }
    }
  }

  removeImage(index: number) {
    this.pickedImages.splice(index, 1);
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
        images: this.pickedImages
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
