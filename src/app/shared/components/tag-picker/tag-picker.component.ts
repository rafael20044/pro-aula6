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
    const seen = new Map<string, string>();
    for (const r of rows) {
      const name = (r.name || '').trim();
      const key = name.toLowerCase();
      if (!seen.has(key) && name) seen.set(key, name);
    }
    this.allTags = Array.from(seen.values());
  }

  open() { this.isOpen = true; }
  close() { this.isOpen = false; this.search = ''; }

  get mainTags(): string[] {
    return this.allTags.slice(0, this.mainCount);
  }

  get filtered(): string[] {
    const q = this.search.trim().toLowerCase();
    const pool = this.allTags.filter(t => !this.selected.some(s => s.toLowerCase() === t.toLowerCase()));
    return q ? pool.filter(t => t.toLowerCase().includes(q)) : pool;
  }

  toggle(tag: string) {
    const lower = tag.toLowerCase();
    const existsIndex = this.selected.findIndex(s => s.toLowerCase() === lower);
    if (existsIndex >= 0) {

      this.selected = this.selected.filter((_, i) => i !== existsIndex);
      this.selectedChange.emit(this.selected);
      return;
    }
    if (this.selected.length >= this.max) return; 
    const original = this.allTags.find(t => t.toLowerCase() === lower) ?? tag;
    this.selected = [...this.selected, original];
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
    const existing = this.allTags.find(t => t.toLowerCase() === q.toLowerCase());
    if (existing) {
      this.toggle(existing);
      this.search = '';
      return;
    }

    const created = await this.tags.create(q);
    if (created?.name) {
      const key = created.name.trim();
      const lower = key.toLowerCase();
      this.allTags = this.allTags.filter(t => t.toLowerCase() !== lower);
      this.allTags.push(key);
      this.toggle(key);
      this.search = '';
    }
  }
}
