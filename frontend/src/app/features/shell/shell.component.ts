import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {

  private readonly store = inject(Store);
  readonly currentUser$ = this.store.select(selectCurrentUser);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',   route: '/app/dashboard' },
    { label: 'Contacts',   icon: 'contacts',    route: '/app/contacts'  },
    { label: 'Companies',  icon: 'business',    route: '/app/companies' },
    { label: 'Deals',      icon: 'monetization_on', route: '/app/deals' },
    { label: 'Tasks',      icon: 'task_alt',    route: '/app/tasks'     },
    { label: 'Settings',   icon: 'settings',    route: '/app/settings'  },
  ];

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
