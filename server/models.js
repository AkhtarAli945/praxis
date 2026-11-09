import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const O = Schema.Types.ObjectId;

export const User = model('User', new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  hash: String,
  policy: {
    email: { type: Boolean, default: true },
    crm: { type: Boolean, default: true },
    readAuto: { type: Boolean, default: true },
  },
}, { timestamps: true }));

export const Course = model('Course', new Schema({
     owner: O, title: String, topic: String, level: String, notes: String,
  lessons: [{ title: String, content: String, quiz: [{ q: String, options: [String], answer: Number }] }],
  completed: [Number],
  scores: [{ lesson: Number, correct: Number, total: Number }],
}, { timestamps: true }));

export const Invoice = model('Invoice', new Schema({ owner: O, client: String, number: String, amount: Number, daysOverdue: Number }));
export const Note = model('Note', new Schema({ owner: O, client: String, text: String }, { timestamps: true }));
export const Audit = model('Audit', new Schema({ owner: O, agent: String, action: String, by: String }, { timestamps: true }));
export const Action = model('Action', new Schema({
  owner: O, prompt: String, reply: String, status: { type: String, default: 'pending' },
  steps: [{ tool: String, args: Schema.Types.Mixed, write: Boolean, status: String, result: Schema.Types.Mixed }],
}, { timestamps: true }));
