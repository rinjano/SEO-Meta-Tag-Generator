import React from 'react';
import { Trash2 } from './icons';
import TextInput from './TextInput';
import TextArea from './TextArea';
import { FAQ } from '../types';


interface FAQItemProps {
  index: number;
  faq: FAQ;
  onChange: (index: number, faq: FAQ) => void;
  onDelete: (index: number) => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ index, faq, onChange, onDelete }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">FAQ {index + 1}</p>
        <button aria-label="Delete FAQ" onClick={() => onDelete(index)} className="text-red-600 hover:text-red-700">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="space-y-2">
        <TextInput
          label="Question"
          tooltip="Fill with frequently asked questions."
          value={faq.q}
          onChange={(val) => onChange(index, { ...faq, q: val })}
          placeholder="Example: What is the main feature?"
        />
        <TextArea
          label="Answer"
          tooltip="A short, clear, and factual answer."
          value={faq.a}
          onChange={(val) => onChange(index, { ...faq, a: val })}
          placeholder="Example: The main feature is X, which helps you with Y."
          rows={3}
        />
      </div>
    </div>
  );
}

export default FAQItem;