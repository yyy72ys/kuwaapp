import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Individual } from '../types';
import { Stage, Sex } from '../types';
import { XIcon, PlusIcon, ClockIcon } from './icons';
import { stageTranslations, sexTranslations } from '../utils/translations';
import { useDebounce } from '../hooks/useDebounce';
import { suggestScientificName } from '../services/geminiService';

interface AddIndividualModalProps {
  onClose: () => void;
  onAdd: (individual: Omit<Individual, 'id' | 'photos' | 'measurements'>) => void;
  individuals: Individual[];
  initialData?: Individual | null;
}

type FormData = {
  individualCode: string;
  speciesCommon: string;
  speciesScientific: string;
  stage: Stage;
  sex: Sex;
  introducedDate: string;
  birthDate?: string;
  lineName?: string;
  parentCodeM?: string;
  parentCodeF?: string;
  notes?: string;
};

const InputField: React.FC<{
    label: string;
    id: keyof FormData;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    list?: string;
    autoComplete?: string;
    onFocus?: () => void;
    onBlur?: () => void;
}> = ({ label, id, value, onChange, required = false, type = 'text', list, autoComplete, onFocus, onBlur }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            required={required}
            list={list}
            autoComplete={autoComplete || "off"}
            onFocus={onFocus}
            onBlur={onBlur}
            className="mt-1 block w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        />
    </div>
);

const SelectField: React.FC<{
    label: string;
    id: keyof FormData;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    required?: boolean;
}> = ({ label, id, value, onChange, options, required=false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 block w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const createInitialFormData = (initialData: Individual | null | undefined): FormData => {
    if (initialData) {
        return {
            individualCode: '', // Must be unique, so clear it
            speciesCommon: initialData.speciesCommon,
            speciesScientific: initialData.speciesScientific,
            stage: initialData.stage,
            sex: initialData.sex,
            introducedDate: new Date().toISOString().split('T')[0], // Set to today
            birthDate: '', // Clear birth date
            lineName: initialData.lineName || '',
            parentCodeM: initialData.parentCodeM || '',
            parentCodeF: initialData.parentCodeF || '',
            notes: '', // Clear notes
        };
    }
    return {
        individualCode: '',
        speciesCommon: '',
        speciesScientific: '',
        stage: Stage.UNKNOWN,
        sex: Sex.UNKNOWN,
        introducedDate: new Date().toISOString().split('T')[0],
        birthDate: '',
        lineName: '',
        parentCodeM: '',
        parentCodeF: '',
        notes: '',
    };
};


export const AddIndividualModal: React.FC<AddIndividualModalProps> = ({ onClose, onAdd, individuals, initialData }) => {
    const [formData, setFormData] = useState<FormData>(() => createInitialFormData(initialData));

    // --- Autocomplete and Suggestions Logic ---
    const uniqueLineNames = useMemo(() => [...new Set(individuals.map(i => i.lineName).filter(Boolean).sort())] as string[], [individuals]);
    const uniqueSpeciesCommon = useMemo(() => [...new Set(individuals.map(i => i.speciesCommon).filter(Boolean).sort())] as string[], [individuals]);
    const uniqueParentCodes = useMemo(() => [...new Set(individuals.map(i => i.individualCode).filter(Boolean).sort())] as string[], [individuals]);
    const uniqueSpeciesScientificFromData = useMemo(() => [...new Set(individuals.map(i => i.speciesScientific).filter(Boolean).sort())] as string[], [individuals]);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    
    const debouncedScientificNameInput = useDebounce(formData.speciesScientific, 500);

    useEffect(() => {
        if (debouncedScientificNameInput.length > 2) {
            const fetchSuggestions = async () => {
                setIsSuggestionsLoading(true);
                try {
                    const geminiSuggestions = await suggestScientificName(debouncedScientificNameInput);
                    const localSuggestions = uniqueSpeciesScientificFromData.filter(s => s.toLowerCase().includes(debouncedScientificNameInput.toLowerCase()));
                    const combined = [...new Set([...geminiSuggestions, ...localSuggestions])];
                    setSuggestions(combined);
                } catch (error) {
                    console.error("Failed to fetch suggestions:", error);
                    setSuggestions(uniqueSpeciesScientificFromData.filter(s => s.toLowerCase().includes(debouncedScientificNameInput.toLowerCase())));
                } finally {
                    setIsSuggestionsLoading(false);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedScientificNameInput, uniqueSpeciesScientificFromData]);
    // --- End of Autocomplete Logic ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setFormData(prev => ({ ...prev, speciesScientific: suggestion }));
        setSuggestions([]);
        setIsSuggestionsVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold">新規個体登録</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <InputField label="個体管理コード" id="individualCode" value={formData.individualCode} onChange={handleChange} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="和名" id="speciesCommon" value={formData.speciesCommon} onChange={handleChange} required list="speciesCommon-list" />
                            <datalist id="speciesCommon-list">
                                {uniqueSpeciesCommon.map(name => <option key={name} value={name} />)}
                            </datalist>

                            <div className="relative">
                                <InputField
                                    label="学名"
                                    id="speciesScientific"
                                    value={formData.speciesScientific}
                                    onChange={handleChange}
                                    required
                                    onFocus={() => setIsSuggestionsVisible(true)}
                                    onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 150)} // Delay to allow click
                                />
                                {isSuggestionsVisible && (debouncedScientificNameInput.length > 2) && (
                                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {isSuggestionsLoading && <div className="px-3 py-2 text-sm text-slate-400 flex items-center gap-2"><ClockIcon className="h-4 w-4 animate-spin"/>検索中...</div>}
                                        {!isSuggestionsLoading && suggestions.length === 0 && <div className="px-3 py-2 text-sm text-slate-400">候補が見つかりません</div>}
                                        <ul>
                                            {suggestions.map((s, index) => (
                                                <li
                                                    key={index}
                                                    onMouseDown={() => handleSuggestionClick(s)}
                                                    className="px-3 py-2 text-sm text-slate-200 hover:bg-emerald-600 cursor-pointer"
                                                >
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <SelectField
                                label="ステージ"
                                id="stage"
                                value={formData.stage}
                                onChange={handleChange}
                                options={Object.values(Stage).map(s => ({ value: s, label: stageTranslations[s] }))}
                                required
                            />
                            <SelectField
                                label="性別"
                                id="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                options={Object.values(Sex).map(s => ({ value: s, label: sexTranslations[s] }))}
                                required
                            />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="管理開始日" id="introducedDate" value={formData.introducedDate} onChange={handleChange} type="date" required />
                            <InputField label="羽化日/孵化日" id="birthDate" value={formData.birthDate || ''} onChange={handleChange} type="date" />
                        </div>
                        <h3 className="text-md font-semibold text-emerald-400 pt-2 border-t border-slate-700">血統情報</h3>
                        <InputField label="血統名" id="lineName" value={formData.lineName || ''} onChange={handleChange} list="lineName-list" />
                        <datalist id="lineName-list">
                            {uniqueLineNames.map(name => <option key={name} value={name} />)}
                        </datalist>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="父個体コード" id="parentCodeM" value={formData.parentCodeM || ''} onChange={handleChange} list="parentCode-list" />
                            <InputField label="母個体コード" id="parentCodeF" value={formData.parentCodeF || ''} onChange={handleChange} list="parentCode-list" />
                            <datalist id="parentCode-list">
                                {uniqueParentCodes.map(code => <option key={code} value={code} />)}
                            </datalist>
                        </div>
                         <h3 className="text-md font-semibold text-emerald-400 pt-2 border-t border-slate-700">その他</h3>
                         <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-300">
                                備考
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full bg-slate-900/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            />
                        </div>

                    </div>
                    <div className="flex items-center justify-end p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700">キャンセル</button>
                        <button type="submit" className="ml-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
                            <PlusIcon className="h-4 w-4" />
                            登録する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};