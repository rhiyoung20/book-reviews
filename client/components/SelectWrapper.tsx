'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface SelectWrapperProps {
  value: string;
  onValueChange: (value: 'title' | 'username') => void;
}

export default function SelectWrapper({ value, onValueChange }: SelectWrapperProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="검색 유형" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="title">제목</SelectItem>
        <SelectItem value="username">작성자</SelectItem>
      </SelectContent>
    </Select>
  );
}
