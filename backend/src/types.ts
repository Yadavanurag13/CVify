export type LinkItem = {
  label: string;
  url: string;
};

export type ExperienceItem = {
  company: string;
  position: string;
  location?: string;
  startDate: string; // YYYY-MM
  endDate: string | null; // null => present
  bullets: string[];
};

export type EducationItem = {
  institution: string;
  degree: string;
  area?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  notes?: string[];
};

export type ProjectItem = {
  name: string;
  link?: string;
  description?: string;
  bullets?: string[];
  tech?: string[];
};

export type Skills = {
  groups: { label: string; items: string[] }[];
};

export type ExtraItem = {
  type: string;
  items: { label: string; value?: string; dates?: string }[];
};

export type ResumeData = {
  templateId: 'sb2nov';
  options?: {
    color?: string;
    showLinks?: boolean;
    sectionOrder?: string[];
  };
  data: {
    basics: {
      name: string;
      headline?: string;
      location?: string;
      email?: string;
      phone?: string;
      links?: LinkItem[];
    };
    summary?: string;
    experience?: ExperienceItem[];
    education?: EducationItem[];
    projects?: ProjectItem[];
    skills?: Skills;
    extras?: ExtraItem[];
  };
};


