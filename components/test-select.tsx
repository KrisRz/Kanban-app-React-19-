"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TestSelect() {
  const [value, setValue] = useState<string>("unassigned");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Select Component</h1>
      
      <div className="space-y-4">
        <Select
          value={value}
          onValueChange={(newValue) => {
            console.log("Selected value:", newValue);
            setValue(newValue);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
        
        <div>
          <p>Current value: {value}</p>
        </div>
        
        <Button onClick={() => console.log("Current value:", value)}>
          Log Current Value
        </Button>
      </div>
    </div>
  );
} 