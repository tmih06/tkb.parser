

import { Text, Link } from "@radix-ui/themes";
import { UniversityConfig, UNIVERSITIES } from "../config/universities";
import { useState } from "react";
import styles from "./SchoolSwitcher.module.scss";

interface UniversitySwitcherProps {
  selectedUniversity: UniversityConfig;
  onUniversityChange: (university: UniversityConfig) => void;
}

export default function UniversitySwitcher({ selectedUniversity, onUniversityChange }: UniversitySwitcherProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (universityId: string) => {
    setImageErrors(prev => new Set([...prev, universityId]));
  };

  return (
    <>
      <Text size='6'>
        Tạo thời khoá biểu cho
      </Text>
      
      <div className={styles.tabs}>
        {UNIVERSITIES.map((university) => (
          <div key={university.id} className={styles.tabGroup}>
            <input
              id={`university-${university.id}`}
              name="university"
              value={university.id}
              type="radio"
              checked={selectedUniversity.id === university.id}
              onChange={() => onUniversityChange(university)}
              style={{ appearance: 'none' }}
            />
            <label 
              htmlFor={`university-${university.id}`}
              style={{
                '--primary-color': university.theme?.primary || '#0a3cff',
                '--secondary-color': university.theme?.secondary || '#667eea'
              } as React.CSSProperties}
            >
              {imageErrors.has(university.id) ? (
                <span className={styles.fallbackText}>{university.displayNumber}</span>
              ) : (
                <img 
                  src={university.logoPath} 
                  alt={`${university.shortName} Logo`}
                  className={styles.UniversityLogo}
                  onError={() => handleImageError(university.id)}
                  onLoad={() => {
                    // Remove from error set if image loads successfully after retry
                    setImageErrors(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(university.id);
                      return newSet;
                    });
                  }}
                />
              )}
            </label>
          </div>
        ))}
      </div>

      <Text size='3' style={{ marginTop: '1rem', fontWeight: 'bold' }}>
        {selectedUniversity.shortName} - {selectedUniversity.name}
      </Text>
      
      <Text size='2' color="gray">
        <span dangerouslySetInnerHTML={{ __html: selectedUniversity.instructions }} />
        {selectedUniversity.videoUrl && (
          <>
            {' '}
            <Link target="_blank" href={selectedUniversity.videoUrl}>
              Xem video hướng dẫn
            </Link>
            .
          </>
        )}
        <br />
        Tất cả các khâu xử lí đều được thực hiện hoàn toàn trên trình duyệt của bạn không thông qua máy chủ thứ 3 nào. Thời khoá biểu đã nhập sẽ tự động lưu vào bộ nhớ của trình duyệt.
      </Text>
    </>
  );
}
