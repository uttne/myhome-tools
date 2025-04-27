import React, { Suspense } from "react";
import { DefaultInnerDebugContent } from "./DefaultInnerDebugContent";

const debugModules = import.meta.glob<true>([
  "./___InnerDebugContent.tsx"]);

const hasDebugPage = Object.keys(debugModules).length > 0;


let ContentLazy: React.LazyExoticComponent<React.FC> | React.FC | undefined =
  undefined;

if (hasDebugPage){
  const load = debugModules["./___InnerDebugContent.tsx"];
  ContentLazy = React.lazy(async () =>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await load();
    return {default: mod.DebugContent };
  }
  );
}
else{
  ContentLazy = DefaultInnerDebugContent;
}

export function DebugContent() {
  return (
    <>
      {ContentLazy && (
        <Suspense fallback={null}>
          <ContentLazy />
        </Suspense>
      )}
    </>
  );
}
