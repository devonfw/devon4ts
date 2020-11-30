import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Todo extends Document {
  @Prop()
  id!: Types.ObjectId;

  @Prop()
  task: string | undefined;

  @Prop()
  status: boolean | undefined;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
