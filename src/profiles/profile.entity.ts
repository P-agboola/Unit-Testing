import { Column, Entity } from 'typeorm';

@Entity()
export class Profile {
  @Column()
  gender: string;

  @Column()
  occupation: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
