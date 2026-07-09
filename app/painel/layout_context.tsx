
import { Type_backendContentBiblioteca, Type_backendStudentLoginResponse } from "@/env"
import { createContext, Dispatch, SetStateAction } from "react"


export type Type_panelSession = Pick<Type_backendStudentLoginResponse, 'student' | 'collegeArray' | 'courseArray'>;

export const PageContext = createContext({} as {
	session: Type_panelSession | null;
	setSession: Dispatch<SetStateAction<Type_panelSession | null>>;
	libraryContentArray: Type_backendContentBiblioteca[];
	setLibraryContentArray: Dispatch<SetStateAction<Type_backendContentBiblioteca[]>>;
	libraryBuyer: boolean;
	refreshLibrary: () => Promise<Type_backendContentBiblioteca[]>;
})
