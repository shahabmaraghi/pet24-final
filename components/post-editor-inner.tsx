"use client";

import * as React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FileRepository,
  Heading,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  PictureEditing,
  Plugin,
  Underline,
  Undo,
  type FileLoader,
} from "ckeditor5";
import translations from "ckeditor5/translations/fa.js";
import "ckeditor5/ckeditor5.css";

class Pet24UploadAdapter {
  constructor(private loader: FileLoader) {}

  upload() {
    return this.loader.file.then(async (file) => {
      if (!file) throw new Error("فایلی انتخاب نشده است.");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "posts");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "بارگذاری تصویر انجام نشد.");
      return { default: String(data.url) };
    });
  }

  abort() {}
}

class Pet24UploadPlugin extends Plugin {
  static get requires() {
    return [FileRepository];
  }

  init() {
    this.editor.plugins.get(FileRepository).createUploadAdapter = (loader) => new Pet24UploadAdapter(loader);
  }
}

export default function PostEditorInner({
  initialData,
  disabled,
  onChange,
}: {
  initialData: string;
  disabled?: boolean;
  onChange: (html: string) => void;
}) {
  const dataRef = React.useRef(initialData);
  const emit = (html: string) => {
    dataRef.current = html;
    onChange(html);
  };

  return (
    <CKEditor
      editor={ClassicEditor}
      data={dataRef.current}
      disabled={disabled}
      config={{
        licenseKey: "GPL",
        plugins: [
          Essentials,
          Paragraph,
          Bold,
          Italic,
          Underline,
          Heading,
          Link,
          List,
          BlockQuote,
          Alignment,
          Undo,
          Autoformat,
          Image,
          ImageCaption,
          ImageStyle,
          ImageToolbar,
          ImageUpload,
          ImageInsert,
          ImageResize,
          PictureEditing,
          Pet24UploadPlugin,
        ],
        toolbar: [
          "undo",
          "redo",
          "|",
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "|",
          "link",
          "insertImage",
          "bulletedList",
          "numberedList",
          "blockQuote",
          "|",
          "alignment",
        ],
        image: {
          toolbar: [
            "imageTextAlternative",
            "toggleImageCaption",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "|",
            "resizeImage",
          ],
          insert: { type: "auto", integrations: ["upload", "url"] },
        },
        language: "fa",
        translations: [translations],
        placeholder: "متن پست را بنویسید...",
      }}
      onReady={(editor) => {
        const html = editor.getData();
        if (html.trim()) emit(html);
        else if (initialData.trim()) {
          editor.setData(initialData);
          emit(initialData);
        }
      }}
      onChange={(_event, editor) => emit(editor.getData())}
      onBlur={(_event, editor) => emit(editor.getData())}
    />
  );
}
