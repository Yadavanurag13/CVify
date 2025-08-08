"use client";
import { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ExperienceSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  bullets: z.array(z.string().min(1)).default([]),
});
const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  area: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
const ProjectSchema = z.object({
  name: z.string().min(1),
  link: z.string().url().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string().min(1)).default([]),
});
const SkillGroupSchema = z.object({ label: z.string().min(1), items: z.array(z.string().min(1)).default([]) });
const LinkSchema = z.object({ label: z.string().min(1), url: z.string().url() });

const Schema = z.object({
  name: z.string().min(1),
  headline: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(LinkSchema).default([]),
  summary: z.string().optional(),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(SkillGroupSchema).default([]),
});

type FormValues = z.input<typeof Schema>;

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(Schema), defaultValues: { name: "", headline: "", email: "", phone: "", location: "", links: [], summary: "", experience: [], education: [], projects: [], skills: [] } });

  const linksFA = useFieldArray({ control, name: "links" });
  const expFA = useFieldArray({ control, name: "experience" });
  const projectsFA = useFieldArray({ control, name: "projects" });

  async function onSubmit(values: FormValues) {
    const payload = {
      templateId: "sb2nov",
      data: {
        basics: {
          name: values.name,
          headline: values.headline,
          email: values.email,
          phone: values.phone,
          location: values.location,
          links: values.links ?? [],
        },
        summary: values.summary,
        experience: (values.experience ?? []).map((e) => ({ ...e, endDate: e.endDate || null })),
        education: values.education ?? [],
        projects: values.projects ?? [],
        skills: { groups: values.skills ?? [] },
        extras: [],
      },
    };
    const resp = await axios.post("http://127.0.0.1:3001/render", payload, { responseType: "blob" });
    const url = URL.createObjectURL(resp.data);
    setPdfUrl(url);
  }

  return (
    <div className="min-h-screen p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input placeholder="Jane Doe" {...register("name")} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Headline</label>
                <Input placeholder="Software Engineer" {...register("headline")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input placeholder="jane@doe.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input placeholder="+1 555 123 4567" {...register("phone")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input placeholder="San Francisco, CA" {...register("location")} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Summary</label>
              <Textarea rows={5} placeholder="Short professional summary" {...register("summary")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Links</label>
              <div className="space-y-3">
                {linksFA.fields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                    <div className="md:col-span-2">
                      <label className="text-xs">Label</label>
                      <Input placeholder="Website" {...register(`links.${idx}.label` as const)} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs">URL</label>
                      <Input placeholder="https://example.com" {...register(`links.${idx}.url` as const)} />
                    </div>
                    <div className="md:col-span-1">
                      <Button type="button" variant="secondary" onClick={() => linksFA.remove(idx)}>Remove</Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => linksFA.append({ label: "", url: "" })}>Add Link</Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Experience</label>
                <Button type="button" variant="outline" onClick={() => expFA.append({ company: "", position: "", location: "", startDate: "", endDate: "", bullets: [] })}>Add Experience</Button>
              </div>
              <div className="space-y-4">
                {expFA.fields.map((field, i) => (
                  <div key={field.id} className="rounded border p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">Company</label>
                        <Input {...register(`experience.${i}.company` as const)} />
                      </div>
                      <div>
                        <label className="text-xs">Position</label>
                        <Input {...register(`experience.${i}.position` as const)} />
                      </div>
                      <div>
                        <label className="text-xs">Location</label>
                        <Input {...register(`experience.${i}.location` as const)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs">Start</label>
                          <Input placeholder="YYYY-MM" {...register(`experience.${i}.startDate` as const)} />
                        </div>
                        <div>
                          <label className="text-xs">End (blank = Present)</label>
                          <Input placeholder="YYYY-MM" {...register(`experience.${i}.endDate` as const)} />
                        </div>
                      </div>
                    </div>

                    <BulletsEditor control={control} name={`experience.${i}.bullets`} register={register} label="Bullets" placeholder="Impactful achievement" />

                    <div className="flex justify-end">
                      <Button type="button" variant="secondary" onClick={() => expFA.remove(i)}>Remove Experience</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Projects</label>
                <Button type="button" variant="outline" onClick={() => projectsFA.append({ name: "", link: "", description: "", bullets: [] })}>Add Project</Button>
              </div>
              <div className="space-y-4">
                {projectsFA.fields.map((field, i) => (
                  <div key={field.id} className="rounded border p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">Name</label>
                        <Input {...register(`projects.${i}.name` as const)} />
                      </div>
                      <div>
                        <label className="text-xs">Link</label>
                        <Input placeholder="https://..." {...register(`projects.${i}.link` as const)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs">Description</label>
                        <Textarea rows={3} {...register(`projects.${i}.description` as const)} />
                      </div>
                    </div>

                    <BulletsEditor control={control} name={`projects.${i}.bullets`} register={register} label="Bullets" placeholder="Highlight" />

                    <div className="flex justify-end">
                      <Button type="button" variant="secondary" onClick={() => projectsFA.remove(i)}>Remove Project</Button>
                    </div>
                  </div>
                ))}
              </div>
        </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Rendering..." : "Render PDF"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-[70vh] border rounded" />
          ) : (
            <p className="text-sm text-muted-foreground">Submit the form to preview your PDF.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type BulletsEditorProps = {
  control: any;
  name: string;
  register: any;
  label: string;
  placeholder?: string;
};

function BulletsEditor({ control, name, register, label, placeholder }: BulletsEditorProps) {
  const bulletsFA = useFieldArray({ control, name });
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Button type="button" size="sm" variant="outline" onClick={() => bulletsFA.append("")}>Add Bullet</Button>
      </div>
      <div className="space-y-2">
        {bulletsFA.fields.map((bf, bi) => (
          <div key={bf.id} className="grid grid-cols-6 gap-2 items-end">
            <div className="col-span-5">
              <Input placeholder={placeholder || "Bullet"} {...register(`${name}.${bi}`)} />
            </div>
            <div className="col-span-1">
              <Button type="button" variant="secondary" onClick={() => bulletsFA.remove(bi)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
