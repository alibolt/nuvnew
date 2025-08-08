'use client';

import { useState } from 'react';
import { SectionItemExpanded } from './section-item-expanded';

interface Section {
  id: string;
  type: string;
  sectionType: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface SectionListNuviProps {
  sections: Section[];
  selectedSection: Section | null;
  onSelectSection: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicateSection?: (section: Section) => void;
  onUpdateSection?: (sectionId: string, updates: any) => void;
  searchQuery: string;
}

export function SectionListNuvi({ 
  sections, 
  selectedSection, 
  onSelectSection, 
  onDeleteSection, 
  onToggleVisibility,
  onDuplicateSection,
  onUpdateSection,
  searchQuery 
}: SectionListNuviProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  
  const filteredSections = searchQuery 
    ? sections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.type || section.sectionType || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  if (searchQuery && filteredSections.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <p className="text-sm text-gray-500">No sections found for "{searchQuery}"</p>
        </div>
      </div>
    );
  }

  const handleSelectSection = (section: Section) => {
    console.log('Section selected:', section);
    onSelectSection(section);
    // Toggle expand/collapse when clicking the same section
    if (expandedSectionId === section.id) {
      setExpandedSectionId(null);
    } else {
      setExpandedSectionId(section.id);
    }
  };

  const handleToggleExpand = (sectionId: string) => {
    setExpandedSectionId(expandedSectionId === sectionId ? null : sectionId);
  };

  return (
    <div className="space-y-0 px-2 py-1">
      {filteredSections.map((section) => (
        <SectionItemExpanded
          key={section.id}
          section={section}
          isSelected={selectedSection?.id === section.id}
          isExpanded={expandedSectionId === section.id}
          onSelect={() => handleSelectSection(section)}
          onToggleExpand={() => handleToggleExpand(section.id)}
          onDelete={onDeleteSection}
          onToggleVisibility={onToggleVisibility}
          onDuplicate={() => onDuplicateSection?.(section)}
          onUpdate={onUpdateSection}
        />
      ))}
    </div>
  );
}