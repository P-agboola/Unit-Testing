import { Task } from 'src/tasks/task.entity';
import { Profile } from '../../profiles/profile.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column()
  email: string;

  @OneToOne(() => Profile, (profile) => profile.user, { onDelete: 'SET NULL' })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
