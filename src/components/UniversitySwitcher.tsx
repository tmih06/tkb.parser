/*
 * MIT License
 *
 * Copyright (c) 2025 michioxd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Text, Link } from "@radix-ui/themes";
import { UniversityConfig, UNIVERSITIES } from "../config/universities";
import { useState } from "react";
import styles from "./UniversitySwitcher.module.scss";

interface UniversitySwitcherProps {
  selectedUniversity: UniversityConfig;
  onUniversityChange: (university: UniversityConfig) => void;
}

export default function UniversitySwitcher({ selectedUniversity, onUniversityChange }: UniversitySwitcherProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (universityId: string) => {
    setImageErrors(prev => new Set([...prev, universityId]));
  };

  const getAssetUrl = (path: string) => {
    // Use Vite's base URL for assets in public folder
    return `${import.meta.env.BASE_URL}${path}`;
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
                  src={getAssetUrl(university.logoPath)} 
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
