"use client";

export function DeleteVideoButton({ action, slug }: { action: (formData: FormData) => Promise<void>; slug: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this video?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button className="quiet-button" type="submit">
        Delete video
      </button>
    </form>
  );
}
