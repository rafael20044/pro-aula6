import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TagDto, TagService } from '../../services/tag-service';

@Component({
  selector: 'app-tag-picker',
  templateUrl: './tag-picker.component.html',
  styleUrls: ['./tag-picker.component.scss'],
  standalone: false,
})
export class TagPickerComponent implements OnInit {
  @Input() min = 1;
  @Input() max = 2;
  @Input() mainCount = 7;
  @Input() selected: string[] = [];
  @Output() selectedChange = new EventEmitter<string[]>();

  isOpen = false;
  search = '';
  allTags: string[] = [];

  constructor(private tags: TagService) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    const rows = await this.tags.getAll();
    this.allTags = rows.map(r => r.name);
  }

  open() { this.isOpen = true; }
  close() { this.isOpen = false; this.search = ''; }

  get mainTags(): string[] {
    return this.allTags.slice(0, this.mainCount);
  }

  get filtered(): string[] {
    const q = this.search.trim().toLowerCase();
    const pool = this.allTags.filter(t => !this.selected.includes(t));
    return q ? pool.filter(t => t.toLowerCase().includes(q)) : pool;
  }

  toggle(tag: string) {
    const set = new Set(this.selected);
    if (set.has(tag)) {
      set.delete(tag);
    } else {
      if (set.size >= this.max) return; // enforce max
      set.add(tag);
    }
    this.selected = Array.from(set);
    this.selectedChange.emit(this.selected);
  }

  remove(tag: string) {
    this.selected = this.selected.filter(t => t !== tag);
    this.selectedChange.emit(this.selected);
  }

  canCreate(): boolean {
    const q = this.search.trim();
    if (!q) return false;
    const exists = this.allTags.some(t => t.toLowerCase() === q.toLowerCase());
    return !exists;
  }

  async createTagFromSearch() {
    const q = this.search.trim();
    if (!q) return;
    const created = await this.tags.create(q);
    if (created?.name) {
      this.allTags = Array.from(new Set([...this.allTags, created.name])).sort();
      this.toggle(created.name);
      this.search = '';
    }
  }
}
