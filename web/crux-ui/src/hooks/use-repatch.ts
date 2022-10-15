import { Dispatch, useReducer } from 'react'

export type RepatchAction<T> = (state: T) => T

export type RepatchReducer<T> = (state: T, action: RepatchAction<T>) => T

export const reducer = <T>(state: T, action: RepatchAction<T>): T => action(state)

const useRepatch = <T>(initialState: T): [T, Dispatch<RepatchAction<T>>] =>
  useReducer<RepatchReducer<T>>(reducer, initialState)

export default useRepatch
