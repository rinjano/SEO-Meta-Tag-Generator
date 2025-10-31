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
        <button aria-label="Hapus FAQ" onClick={() => onDelete(index)} className="text-red-600 hover:text-red-700">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="space-y-2">
        <TextInput
          label="Pertanyaan"
          tooltip="Isi dengan pertanyaan yang sering diajukan."
          value={faq.q}
          onChange={(val) => onChange(index, { ...faq, q: val })}
          placeholder="Contoh: Apa fitur utamanya?"
        />
        <TextArea
          label="Jawaban"
          tooltip="Jawaban yang singkat, jelas, dan faktual."
          value={faq.a}
          onChange={(val) => onChange(index, { ...faq, a: val })}
          placeholder="Contoh: Fitur utamanya adalah X, yang membantu Anda dengan Y."
          rows={3}
        />
      </div>
    </div>
  );
}

export default FAQItem;