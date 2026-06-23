import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
} from 'docx'
import { TailoredSections } from '@/types/jobs'

function contactLine(info: TailoredSections['personalInfo']): string {
  return [info.email, info.phone, info.linkedin, info.location]
    .filter(Boolean)
    .join('  |  ')
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 60 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 4 },
    },
  })
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 40 },
  })
}

export async function buildDocx(data: TailoredSections): Promise<Buffer> {
  const children: Paragraph[] = []

  // Header
  children.push(
    new Paragraph({
      text: data.personalInfo.name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: contactLine(data.personalInfo), size: 18, color: '555555' }),
      ],
    })
  )

  // Work Experience
  if (data.workExperiences.length > 0) {
    children.push(sectionHeading('Experience'))
    for (const we of data.workExperiences) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: we.title, bold: true }),
            new TextRun({ text: `  ${we.company}`, color: '555555' }),
            new TextRun({
              text: `  ${we.startDate} – ${we.endDate ?? 'Present'}`,
              color: '555555',
              italics: true,
            }),
          ],
        })
      )
      for (const b of we.bullets) children.push(bullet(b))
    }
  }

  // Skills
  if (data.skills.length > 0) {
    children.push(sectionHeading('Skills'))
    const byCategory = data.skills.reduce<Record<string, string[]>>((acc, s) => {
      acc[s.category] = [...(acc[s.category] ?? []), s.name]
      return acc
    }, {})
    for (const [cat, names] of Object.entries(byCategory)) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${cat}: `, bold: true }),
            new TextRun({ text: names.join(', ') }),
          ],
        })
      )
    }
  }

  // Education
  if (data.education.length > 0) {
    children.push(sectionHeading('Education'))
    for (const e of data.education) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: e.degree, bold: true }),
            new TextRun({ text: `  ${e.school}`, color: '555555' }),
          ],
        })
      )
    }
  }

  // Projects
  if (data.projects.length > 0) {
    children.push(sectionHeading('Projects'))
    for (const p of data.projects) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: p.name, bold: true }),
            ...(p.url ? [new TextRun({ text: `  ${p.url}`, color: '4472C4' })] : []),
          ],
        })
      )
      if (p.description) {
        children.push(
          new Paragraph({
            text: p.description,
            spacing: { after: 40 },
            children: [new TextRun({ text: p.description, italics: true, color: '555555' })],
          })
        )
      }
      for (const b of p.bullets) children.push(bullet(b))
    }
  }

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: { size: 32, bold: true, color: '111111' },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { size: 20, bold: true, color: '111111', allCaps: true },
        },
      ],
    },
    sections: [{ children }],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
