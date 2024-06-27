import { StatesExportHelper, StatesHook } from 'alova';
import { Dispatch, SetStateAction } from 'react';

export type ReactHookExportType<T> = StatesExportHelper<{
  name: 'React';
  State: ReactState<T>;
  Computed: any[];
  Export: T | any[];
  Watched: T;
  StateExport: T;
  ComputedExport: T;
}>;

type ReactState<D> = [D, Dispatch<SetStateAction<D>>];
export type ReactHookType = StatesHook<ReactHookExportType<unknown>>;
declare const reactHook: ReactHookType;

export default reactHook;
