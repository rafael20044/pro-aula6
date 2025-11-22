import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionDetailsPage } from './question-details.page';

describe('QuestionDetailsPage', () => {
  let component: QuestionDetailsPage;
  let fixture: ComponentFixture<QuestionDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
