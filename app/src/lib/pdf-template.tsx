import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { TailoredSections } from '@/types/jobs'

Font.register({
  family: 'Times-Roman',
  src: 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeasahcWByWoh4.woff2',
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 48,
    paddingRight: 48,
    color: '#111',
  },
  header: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#111',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 9,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#111',
    borderBottomWidth: 0.75,
    borderBottomColor: '#aaa',
    paddingBottom: 2,
    marginBottom: 5,
    marginTop: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 1,
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  entryMeta: {
    fontSize: 9,
    color: '#555',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 6,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#555',
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 9.5,
  },
  skillCat: {
    fontFamily: 'Helvetica-Bold',
    marginRight: 4,
  },
  entryBlock: {
    marginBottom: 7,
  },
})

export function ResumePDF({ data }: { data: TailoredSections }) {
  const skillsByCategory = data.skills.reduce<Record<string, string[]>>((acc, s) => {
    acc[s.category] = [...(acc[s.category] ?? []), s.name]
    return acc
  }, {})

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo.name}</Text>
          <View style={styles.contactRow}>
            {data.personalInfo.email && <Text>{data.personalInfo.email}</Text>}
            {data.personalInfo.phone && <Text>{data.personalInfo.phone}</Text>}
            {data.personalInfo.linkedin && <Text>{data.personalInfo.linkedin}</Text>}
            {data.personalInfo.location && <Text>{data.personalInfo.location}</Text>}
          </View>
        </View>

        {/* Work Experience */}
        {data.workExperiences.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.workExperiences.map((we) => (
              <View key={we.id} style={styles.entryBlock}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{we.title}</Text>
                  <Text style={styles.entryMeta}>
                    {we.startDate} – {we.endDate ?? 'Present'}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{we.company}</Text>
                {we.bullets.map((b, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            {Object.entries(skillsByCategory).map(([cat, names]) => (
              <View key={cat} style={styles.skillRow}>
                <Text style={styles.skillCat}>{cat}:</Text>
                <Text>{names.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((e, i) => (
              <View key={i} style={styles.entryBlock}>
                <Text style={styles.entryTitle}>{e.degree}</Text>
                <Text style={styles.entrySubtitle}>{e.school}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((p, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{p.name}</Text>
                  {p.url && <Text style={styles.entryMeta}>{p.url}</Text>}
                </View>
                {p.description && (
                  <Text style={styles.entrySubtitle}>{p.description}</Text>
                )}
                {p.bullets.map((b, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
