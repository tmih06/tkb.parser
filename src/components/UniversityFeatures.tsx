

import { Checkbox, Flex, TextField } from "@radix-ui/themes";
import { UniversityConfig } from "../config/universities";

interface UniversityFeaturesProps {
  selectedUniversity: UniversityConfig;
  // Standard features
  byWeek: boolean;
  setByWeek: (value: boolean) => void;
  week: number;
  setWeek: (value: number) => void;
  byDateRange: boolean;
  setByDateRange: (value: boolean) => void;
  dateRangeStart: string;
  setDateRangeStart: (value: string) => void;
  dateRangeEnd: string;
  setDateRangeEnd: (value: string) => void;
  showOnlyAvailable: boolean;
  setShowOnlyAvailable: (value: boolean) => void;
  onlyToday: boolean;
  setOnlyToday: (value: boolean) => void;
  mergeTimeRanges: boolean;
  setMergeTimeRanges: (value: boolean) => void;
  autoFitSchedule: boolean;
  setAutoFitSchedule: (value: boolean) => void;
  // Custom features
  customFeatures: Record<string, boolean>;
  setCustomFeatures: (features: Record<string, boolean>) => void;
}

export default function UniversityFeatures({
  selectedUniversity,
  byWeek,
  setByWeek,
  week,
  setWeek,
  byDateRange,
  setByDateRange,
  dateRangeStart,
  setDateRangeStart,
  dateRangeEnd,
  setDateRangeEnd,
  showOnlyAvailable,
  setShowOnlyAvailable,
  onlyToday,
  setOnlyToday,
  mergeTimeRanges,
  setMergeTimeRanges,
  autoFitSchedule,
  setAutoFitSchedule,
  customFeatures,
  setCustomFeatures
}: UniversityFeaturesProps) {
  const features = selectedUniversity.features;

  const handleCustomFeatureChange = (featureId: string, value: boolean) => {
    setCustomFeatures({
      ...customFeatures,
      [featureId]: value
    });
  };

  return (
    <Flex align={{
      initial: 'start',
      sm: 'center'
    }} gap="2" style={{ marginBottom: '1rem' }} direction={{
      initial: 'column',
      sm: 'row'
    }} wrap="wrap">
      {/* Standard Features */}
      {features.byWeek && (
        <Flex gap="2" align="center">
          <Checkbox
            checked={byWeek}
            onCheckedChange={(e) => setByWeek(Boolean(e))}
          />
          Theo tuần
          <TextField.Root
            disabled={!byWeek}
            style={{ width: '3rem' }}
            value={week}
            onChange={(e) => setWeek(Number(e.currentTarget.value))}
            size="1" type="number" placeholder="Tuần"
          />
        </Flex>
      )}

      {features.byDateRange && (
        <Flex gap="2" align="center">
          <Checkbox
            checked={byDateRange}
            onCheckedChange={(e) => setByDateRange(Boolean(e))}
          />
          Theo khoảng ngày
          <TextField.Root
            disabled={!byDateRange}
            style={{ width: '9rem' }}
            value={dateRangeStart}
            onChange={(e) => setDateRangeStart(e.currentTarget.value)}
            size="1" 
            type="date"
            placeholder="Từ ngày"
          />
          <TextField.Root
            disabled={!byDateRange}
            style={{ width: '9rem' }}
            value={dateRangeEnd}
            onChange={(e) => setDateRangeEnd(e.currentTarget.value)}
            size="1" 
            type="date"
            placeholder="Đến ngày"
          />
        </Flex>
      )}

      {features.showOnlyAvailable && (
        <Flex gap="2" align="center">
          <Checkbox
            checked={showOnlyAvailable}
            onCheckedChange={(e) => setShowOnlyAvailable(Boolean(e))}
          />
          Chỉ hiển thị mốc thời gian có lịch học
        </Flex>
      )}

      {features.onlyToday && (
        <Flex gap="2" align="center">
          <Checkbox
            checked={onlyToday}
            onCheckedChange={(e) => setOnlyToday(Boolean(e))}
          />
          Chỉ hiển thị lịch học hôm nay
        </Flex>
      )}

      <Flex gap="2" align="center">
        <Checkbox
          checked={autoFitSchedule}
          onCheckedChange={(e) => setAutoFitSchedule(Boolean(e))}
        />
        Tự động co vừa màn hình
      </Flex>

      {/* Merge time ranges feature - only for UFL */}
      {selectedUniversity.id === 'ufl' && (
        <Flex gap="2" align="center">
          <Checkbox
            checked={mergeTimeRanges}
            onCheckedChange={(e) => setMergeTimeRanges(Boolean(e))}
          />
          Gộp mốc thời gian
        </Flex>
      )}

      {/* Custom Features */}
      {features.customFeatures?.map((feature) => (
        <Flex key={feature.id} gap="2" align="center">
          <Checkbox
            checked={customFeatures[feature.id] ?? feature.defaultValue}
            onCheckedChange={(e) => handleCustomFeatureChange(feature.id, Boolean(e))}
          />
          {feature.label}
        </Flex>
      ))}
    </Flex>
  );
}
