import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';
import { ReactionService, ReactionType, TargetType } from 'src/app/shared/services/reaction-service';
import { UserService } from 'src/app/shared/services/user-service';
import { StorageService } from 'src/app/shared/services/storage-service';
import { Const } from 'src/app/const/const';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage-service';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss'],
  standalone: false,
})
export class QuestionCardComponent implements OnInit {
  @Input() question!: IQuestionHome;
  @Input() handle?: string; // username before @ from author's email
  @Output() emiter = new EventEmitter<boolean>();

  likeCount = 0;
  dislikeCount = 0;
  userReaction: 'LIKE' | 'DISLIKE' | null = null;
  sending = false;
  avatarUrl: string | null = null;
  imageUrls: string[] = [];
  userID = 0;

  constructor(
    private readonly reactionService: ReactionService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly storageService: StorageService,
    private readonly local:LocalStorageService,
    private readonly reactionS:ReactionService,
  ) { }

  ngOnInit() {
    this.likeCount = this.getLikeCount();
    this.dislikeCount = this.getDislikeCount();
    // resolve avatar and question images to usable URLs
    this.resolveAvatar();
    this.resolveImages();
    this.userID = parseInt(this.local.get(Const.USER_ID) || '0');
  }

  trackTag(index: number, tag: string) { return tag + index; }

  getAvatarSrc(): string | null {
    const q: any = this.question as any;
    return q?.photo ?? q?.photo_url ?? q?.avatar_url ?? q?.user_photo ?? null;
  }

  private async resolveAvatar() {
    try {
      const raw = this.getAvatarSrc();
      if (!raw) { this.avatarUrl = null; return; }
      if (typeof raw === 'string' && raw.startsWith('http')) {
        this.avatarUrl = raw;
        return;
      }
      // assume path inside storage
      const signed = await this.storageService.getSignUrl(Const.BUCKET, raw);
      this.avatarUrl = signed?.url || null;
    } catch (err) {
      console.warn('Could not resolve avatar URL', err);
      this.avatarUrl = null;
    }
  }

  getImagesList(): Array<any> {
    const q: any = this.question as any;
    if (Array.isArray(q?.images) && q.images.length) return q.images;
    if (Array.isArray(q?.images_urls) && q.images_urls.length) return q.images_urls;
    return [];
  }

  private async resolveImages() {
    try {
      const items = this.getImagesList();
      const out: string[] = [];
      for (const it of items) {
        if (!it) continue;
        if (typeof it === 'string') {
          if (it.startsWith('http')) out.push(it);
          else {
            const signed = await this.storageService.getSignUrl(Const.BUCKET, it);
            if (signed?.url) out.push(signed.url);
          }
        } else if (typeof it === 'object') {
          const candidate = (it.url || it.image_url || it.path || it.image) as string | undefined;
          if (!candidate) continue;
          if (candidate.startsWith('http')) out.push(candidate);
          else {
            const signed = await this.storageService.getSignUrl(Const.BUCKET, candidate);
            if (signed?.url) out.push(signed.url);
          }
        }
      }
      this.imageUrls = out;
    } catch (err) {
      console.warn('Could not resolve images', err);
      this.imageUrls = [];
    }
  }

  getAnswerCount(): number {
    return this.question.comment_count;
  }

  getLikeCount(): number {
    return (this.question as any).like_count ?? 0;
  }

  getDislikeCount(): number {
    return (this.question as any).dislike_count ?? 0;
  }

  async onLike() {
    try {
      if (this.sending) return; // prevent double click spam
      this.sending = true;
      await this.auth.ensureReady();
      const user = this.auth.getUser();
      if (!user?.id) {
        console.warn('User not logged in');
        this.sending = false;
        return;
      }

      // usar ID interno cacheado si existe, si no buscar y cachear
      let userId = this.auth.getInternalUserId();
      if (!userId) {
        const found = await this.userService.findIdByUid(user.id);
        userId = found ?? null;
      }
      if (!userId) {
        console.warn('Could not find user ID');
        return;
      }

      const questionId = (this.question as any).question_id;
      const previous = this.userReaction;
      const result = await this.reactionService.reaction(userId, questionId, 'question_id', 'LIKE');
      if (result) {
        // optimistic counts update
        if (previous === 'LIKE') {
          // toggled to DISLIKE
          this.likeCount = Math.max(0, this.likeCount - 1);
          this.dislikeCount += 1;
          this.userReaction = 'DISLIKE';
        } else if (previous === 'DISLIKE') {
          // switched from DISLIKE to LIKE
          this.dislikeCount = Math.max(0, this.dislikeCount - 1);
          this.likeCount += 1;
          this.userReaction = 'LIKE';
        } else {
          // first reaction
          if (result === 'LIKE') {
            this.likeCount += 1;
            this.userReaction = 'LIKE';
          } else if (result === 'DISLIKE') {
            this.dislikeCount += 1;
            this.userReaction = 'DISLIKE';
          }
        }
      }
    } catch (err) {
      console.error('Error in onLike:', err);
    } finally {
      this.sending = false;
    }
  }

  async onDislike() {
    try {
      if (this.sending) return;
      this.sending = true;
      await this.auth.ensureReady();
      const user = this.auth.getUser();
      if (!user?.id) {
        console.warn('User not logged in');
        this.sending = false;
        return;
      }

      let userId = this.auth.getInternalUserId();
      if (!userId) {
        const found = await this.userService.findIdByUid(user.id);
        userId = found ?? null;
      }
      if (!userId) {
        console.warn('Could not find user ID');
        return;
      }

      const questionId = (this.question as any).question_id;
      const previous = this.userReaction;
      const result = await this.reactionService.reaction(userId, questionId, 'question_id', 'DISLIKE');
      if (result) {
        if (previous === 'DISLIKE') {
          // toggled to LIKE
          this.dislikeCount = Math.max(0, this.dislikeCount - 1);
          this.likeCount += 1;
          this.userReaction = 'LIKE';
        } else if (previous === 'LIKE') {
          this.likeCount = Math.max(0, this.likeCount - 1);
          this.dislikeCount += 1;
          this.userReaction = 'DISLIKE';
        } else {
          if (result === 'LIKE') {
            this.likeCount += 1;
            this.userReaction = 'LIKE';
          } else if (result === 'DISLIKE') {
            this.dislikeCount += 1;
            this.userReaction = 'DISLIKE';
          }
        }
      }
    } catch (err) {
      console.error('Error in onDislike:', err);
    } finally {
      this.sending = false;
    }
  }

  async reaction(target: TargetType, type: ReactionType) {
    if (target === 'question_id') {
      const id = this.question?.question_id || 0;
      await this.reactionService.reaction(this.userID, id, target, type);
      this.emiter.emit(true);
      return;
    }
  }

  onComment() {
    const questionId = (this.question as any).question_id;
    if (!questionId) {
      console.warn('No question ID available');
      return;
    }
    // TODO: Create question detail route/page before navigating
    console.log('Navigate to question detail:', questionId);
    // this.router.navigate(['/question', questionId]);
  }

  goToDetaiss() {
    this.router.navigate([`/question-details/${this.question.question_id}`]);
  }
}
