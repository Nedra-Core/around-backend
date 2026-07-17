import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({unique: true})
  email!: string;

  @Column()
  password!: string;

  @Column({name: 'first_name'})
  firstName!: string;

  @Column({name: 'last_name'})
  lastName!: string;

  @Column({default: false})
  isDeleted!: boolean;
}