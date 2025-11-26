import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { welcomeGuard } from './core/guards/welcome-guard';
import { authGuard } from './core/guards/auth-guard';
import { loggedGuard } from './core/guards/logged-guard';
import { roleGuard } from './core/guards/role-guard';

const routes: Routes = [
  // Página de bienvenida 
  {
    path: 'welcome',
    loadChildren: () => import('./pages/user/welcome/welcome.module').then(m => m.WelcomePageModule)
  },

  // Autenticación (login y formulario de registro)
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadChildren: () => import('./pages/user/auth/login/login.module').then(m => m.LoginPageModule),
        canActivate: [welcomeGuard, loggedGuard]
      },
      {
        path: 'register',
        loadChildren: () => import('./pages/user/auth/register/register.module').then(m => m.RegisterPageModule)
      }
    ]
  },

  // Home de usuario
  {
    path: 'home',
    loadChildren: () => import('./pages/user/home/home.module').then(m => m.HomePageModule),
    canActivate: [authGuard, roleGuard]
  },

  // Rutas del usuario
  {
    path: 'user',
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/user/home/home.module').then(m => m.HomePageModule),
        canActivate: [authGuard]
      },
      {
        path: 'create-question',
        loadChildren: () => import('./pages/user/create-question/create-question.module').then(m => m.CreateQuestionPageModule),
        canActivate: [authGuard]
      }
    ]
  },
{
    path: 'question-details/:id',
    loadChildren: () => import('./pages/user/question-details/question-details.module').then( m => m.QuestionDetailsPageModule)
  },

  // Editar perfil
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/user/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule)
  },

  // Área del administrador
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard]
  },
  
  // Default: a login
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Fallback
  { path: '**', redirectTo: 'auth/login' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
