import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';
import 'katex/dist/katex.css';

import { Dispatch, SetStateAction, useCallback } from 'react';

import dynamic from 'next/dynamic';
import katex from 'katex';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export interface CustomMDEditorProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const CustomMDEditor = ({ value, setValue }: CustomMDEditorProps) => {
  const handleOnChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
    },
    [setValue],
  );
  return (
    <MDEditor
      value={value}
      onChange={(newValue) => handleOnChange(newValue as string)}
      textareaProps={{
        placeholder: 'Digite aqui...',
      }}
      previewOptions={{
        components: {
          code: ({ inline, children = [], className }) => {
            const txt = children[0] || '';
            if (inline) {
              if (typeof txt === 'string' && /^\$\$(.*)\$\$/.test(txt)) {
                const html = katex.renderToString(
                  txt.replace(/^\$\$(.*)\$\$/, '$1'),
                  {
                    throwOnError: false,
                  },
                );
                return <code dangerouslySetInnerHTML={{ __html: html }} />;
              }
              return <code>{txt}</code>;
            }
            if (
              typeof txt === 'string' &&
              typeof className === 'string' &&
              /^language-katex/.test(className.toLocaleLowerCase())
            ) {
              const html = katex.renderToString(txt, {
                throwOnError: false,
              });
              return <code dangerouslySetInnerHTML={{ __html: html }} />;
            }
            return <code className={String(className)}>{txt}</code>;
          },
        },
      }}
    />
  );
};

export default CustomMDEditor;
