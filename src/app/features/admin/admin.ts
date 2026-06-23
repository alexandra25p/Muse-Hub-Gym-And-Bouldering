import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';
import { AppNavbar } from '../../core/shared/app-navbar/app-navbar';
import { UserService } from '../../core/services/user.service';
import { ClassesService } from '../../core/services/classes.service';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

interface MockMember {
  id: string; 
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  joinDate: string;
  initials: string;
}

@Component({
  selector: 'app-admin',
  imports: [AppNavbar, NzTableModule, NzButtonModule, NzTagModule, NzIconModule, NzAvatarModule, NzSwitchModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private userService = inject(UserService);
  private classesService = inject(ClassesService);
  private router = inject(Router);

  user = this.userService.user;
  members = signal<MockMember[]>([]);
  classes = this.classesService.classes;
  expandedClass = signal<string | null>(null);
  loadingError = signal('');

  activeCount = computed(() => this.members().filter(m => m.status === 'active').length);
  memberCount  = computed(() => this.members().filter(m => m.role === 'member').length);

  async ngOnInit() {
    await this.loadMembers();
  }

  async loadMembers() {
    this.loadingError.set('');
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const list: MockMember[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const firstName = data['firstName'] || '';
        const lastName = data['lastName'] || '';
        const fullName = data['name'] || `${firstName} ${lastName}`.trim() || 'User';
        const initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || fullName.substring(0, 2).toUpperCase() || 'U';

        list.push({
          id: docSnap.id,
          name: fullName,
          email: data['email'] || '',
          role: data['role'] || 'member',
          status: data['status'] || 'active',
          joinDate: data['createdAt'] ? new Date(data['createdAt']).toLocaleDateString('ro-RO') : 'N/A',
          initials: initials
        });
      });
      this.members.set(list);
    } catch (error: any) {
      console.error('Error loading members from Firestore:', error);
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        this.loadingError.set('Eroare de permisiune (Permission Denied). Asigurați-vă că ați adăugat permisiunile de citire în regulile Firestore din Consola Firebase (vezi documentația de mai sus).');
      } else {
        this.loadingError.set('Eroare la încărcarea membrilor: ' + (error.message || error));
      }
    }
  }

  isAttended(classId: string, email: string): boolean {
    return this.classesService.isAttended(classId, email);
  }

  toggleAttendance(classId: string, email: string, present: boolean): void {
    this.classesService.markAttendance(classId, email, present);
  }

  toggleExpand(classId: string): void {
    this.expandedClass.update(cur => (cur === classId ? null : classId));
  }

  async toggleStatus(memberId: string): Promise<void> {
    const member = this.members().find(m => m.id === memberId);
    if (!member) return;
    const newStatus = member.status === 'active' ? 'inactive' : 'active';

    try {
      const userDocRef = doc(db, 'users', memberId);
      await updateDoc(userDocRef, { status: newStatus });

      this.members.update(list =>
        list.map(m => m.id === memberId ? { ...m, status: newStatus } : m)
      );
      console.log(`Statusul membrului ${member.email} a fost salvat ca ${newStatus} în Firestore.`);
    } catch (error) {
      console.error('Eroare la actualizarea statusului în Firestore:', error);
    }
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
