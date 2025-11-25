import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IQuestionBytitle } from 'src/app/interfaces/iquestionbytitle';
import { QuestionService } from '../../services/question-service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: false,
})
export class SearchComponent implements OnInit, OnDestroy {
  showLogo = true;
  searchControl = new FormControl('');
  results: IQuestionBytitle[] = [];
  isSearching = false;
  hasSearched = false;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly question: QuestionService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    // Búsqueda en tiempo real 
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && value.trim().length > 0) {
          this.search(value.trim());
        } else {
          this.clearResults();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async search(text?: string) {
    const searchText = text || this.searchControl.value;
    if (!searchText || searchText.trim().length === 0) {
      this.clearResults();
      return;
    }

    this.isSearching = true;
    try {
      this.results = await this.question.findByTitle(searchText);
      this.hasSearched = true;
    } catch (error) {
      console.error('Error searching:', error);
      this.results = [];
    } finally {
      this.isSearching = false;
    }
  }

  clearResults() {
    this.results = [];
    this.hasSearched = false;
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.clearResults();
  }

  goToQuestion(questionId: number) {
    this.router.navigate([`question-details/${questionId}`]);
  }

  trackByQuestionId(index: number, question: IQuestionBytitle): number {
    return question.question_id;
  }

}
