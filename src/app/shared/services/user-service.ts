import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { IUserProfile } from 'src/app/interfaces/iuserprofile';
import { PhotoService } from './photo-service';
import { IUserUpdate } from 'src/app/interfaces/iuserupdate';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private readonly photoService: PhotoService) { }

  async createUser(user: any) {
    const { data, error } = await Supabase.from(Const.TB_USER).insert(user);

    if (error) {
      return false;
    }

    return true;
  }

  async countAllUser() {
    const { data, error } = await Supabase.from(Const.TB_USER).select('id');
    if (error) {
      console.log(error);
      return 0;
    }
    return data.length;
  }

  async findIdByUid(uid:string){
    const {data, error} = await Supabase.from(Const.TB_USER).select('id').eq('uid', uid).single();
    if (error) {
      console.log(error);
      return null;
    }
    return data.id as number;
  }

  async getUser(id:number){
    const {data, error} = 
      await Supabase.from(Const.TB_USER).select('id, name, last_name, email, photo, created_at').
      eq('id', id).single();

    if (error) {
      console.log(error);
      return;
    }
    return data as IUserProfile;
  }

  async removeUser(uid:string){
    const {error} = await Supabase.auth.admin.deleteUser(uid);
    if (error) {
      console.log(error);
      return false;
    }
    return true;
  }


  async getFullName(id:number){
    const {data, error} = await Supabase.from(Const.TB_USER)
      .select('name, name2, last_name, last_name2')
      .eq('id', id)
      .single();
    if (error) {
      console.log(error);
      return null;
    }
    return `${data.name} ${data.name2} ${data.last_name} ${data.last_name2}`;
  }

  /**
   * Obtiene un usuario por ID con su foto 
   * @param id - ID del usuario
   * @returns Usuario con la foto
   */
  async getUserWithPhoto(id: number): Promise<(IUserProfile & { photoUrl: string | null }) | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const photoUrl = await this.photoService.resolvePhotoUrl(user.photo);
    return { ...user, photoUrl };
  }

  /**
   * Obtiene múltiples usuarios con sus fotos
   * @param ids - Array de IDs de usuarios
   * @returns Map de userId -> usuario con foto
   */
  async getUsersWithPhotos(ids: number[]): Promise<Map<number, IUserProfile & { photoUrl: string | null }>> {
    const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
    const result = new Map<number, IUserProfile & { photoUrl: string | null }>();

    if (uniqueIds.length === 0) return result;

    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .select('id, name, last_name, email, photo, created_at')
      .in('id', uniqueIds);

    if (error) {
      console.error('Error fetching users:', error);
      return result;
    }

    if (!data) return result;

    // Resolver todas las fotos
    const photos = await this.photoService.resolveMultiplePhotos(data.map(u => u.photo));

    data.forEach((user, index) => {
      result.set(user.id, {
        ...user as IUserProfile,
        photoUrl: photos[index]
      });
    });

    return result;
  }

  async updateUser(user:IUserUpdate, id:number){
    const {error} = await Supabase.from(Const.TB_USER).update(user).eq('id', id);
    return (error) ? false : true;
  }

  /**
   * Obtiene un usuario por UID con todos sus campos
   * @param uid - UID del usuario de autenticación
   * @returns Usuario completo
   */
  async getUserByUid(uid: string) {
    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .select('id, name, name2, last_name, last_name2, email, photo, path, created_at')
      .eq('uid', uid)
      .single();

    if (error) {
      console.error('Error fetching user by uid:', error);
      return null;
    }

    return data;
  }
}
