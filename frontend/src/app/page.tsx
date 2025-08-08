"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

type FormValues = z.infer<typeof Schema>;

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(Schema), defaultValues: { name: "", headline: "", email: "", phone: "", location: "", links: [], summary: "", experience: [], education: [], projects: [], skills: [] } });

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
          links: values.links,
        },
        summary: values.summary,
        experience: values.experience.map((e) => ({ ...e, endDate: e.endDate || null })),
        education: values.education,
        projects: values.projects,
        skills: { groups: values.skills },
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
            <div className="grid grid-cols-1 gap-2">
              <label className="block text-sm font-medium">Links (label,url per line)</label>
              <Textarea rows={3} placeholder="GitHub, https://github.com/janedoe\nWebsite, https://janedoe.dev" onBlur={(e) => {
                const lines = e.target.value.split("\n").map((l) => l.trim()).filter(Boolean);
                const links = lines.map((l) => {
                  const [label, url] = l.split(/,\s*/);
                  return label && url ? { label, url } : null;
                }).filter(Boolean) as {label:string;url:string}[];
                // @ts-ignore
                (window as any).setLinks && (window as any).setLinks(links);
              }} />
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
