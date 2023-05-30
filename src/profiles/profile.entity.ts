import { User } from '../users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryColumn()
  id: number;

  @Column()
  gender: string;

  @Column()
  occupation: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
