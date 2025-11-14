// components/CommentInput.tsx
"use client";

interface CommentInputProps {
  postId: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (postId: string) => void;
}

export default function CommentInput({
  postId,
  value,
  onChange,
  onSubmit,
}: CommentInputProps) {
  return (
    <div className="mt-[8px] flex items-center gap-2">
      <textarea
        className="w-full border-none focus:border-none focus:ring-0 outline-none resize-none text-sm placeholder-gray-400"
        placeholder="Adicionar comentário..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
      />
      {value?.trim() && (
        <button
          onClick={() => onSubmit(postId)}
          className="text-sm text-gray-600 font-medium bg-transparent border-none p-0 m-0 cursor-pointer"
          style={{ appearance: "none" }}
        >
          Publicar
        </button>
      )}
    </div>
  );
}
