"use client";

import React from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";

export const animals = [
  { key: "cat", label: "Cat" },
  { key: "dog", label: "Dog" },
  { key: "elephant", label: "Elephant" },
  { key: "lion", label: "Lion" },
  { key: "tiger", label: "Tiger" },
];

export default function TuitionPostForm() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = React.useState("");

  const labelMap = React.useMemo(
    () => Object.fromEntries(animals.map((a) => [a.key, a.label])),
    []
  );

  return (
    <Autocomplete
      label="Favorite Animal"
      placeholder="Type to search..."
      selectionMode="multiple"
      selectedKeys={selected}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSelectionChange={(keys) => {
        const set = new Set(keys as Set<string>);
        setSelected(set); 

        // Update input text: "lion & cat"
        const text = Array.from(set)
          .map((k) => labelMap[k].toLowerCase())
          .join(" & ");

        setInputValue(text);
      }}
      items={animals}
    >
      {(item) => (
        <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
}
