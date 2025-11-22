import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FilePickerService } from 'src/app/core/services/file-picker-service';
import { IImage } from 'src/app/interfaces/iimage';
import { ToastService } from '../../services/toast-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { QuestionService } from '../../services/question-service';
import { IQuestioCreate } from 'src/app/interfaces/iquestioncreate';
import { Const } from 'src/app/const/const';
import { Router } from '@angular/router';

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

  constructor(
      private fb: FormBuilder, 
      private filePicker: FilePickerService, 
      private toast:ToastService,
      private local:LocalStorageService,
      private question:QuestionService,
      private route:Router
    ) {
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

  async submit() {
    if (!this.form.valid) {
      this.toast.show('Complete los campos obligatorio', 1500, 'bottom', 'warning');
      return;
    }
    const id = this.local.get(Const.USER_ID) as number;
    const question:IQuestioCreate = {
      user_id: id,
      body: this.form.value.body,
      title: this.form.value.title,
    }
    const questionId = await this.question.createQuestion(question, this.form.value.tags, this.pickedImages);
    if (questionId) {
      this.toast.show('pregunta creada con exito');
      this.route.navigate(['/home']);
    }
  }

}
