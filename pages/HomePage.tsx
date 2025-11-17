
import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Évaluez, optimisez et révélez votre plein potentiel.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Go'Top Pro est la plateforme de formation B2B conçue pour les gérants de salons de beauté, restaurants et boutiques. Diagnostiquez vos pratiques et recevez un parcours de formation sur-mesure généré par l'IA.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                to="/quiz"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Évaluer mon Potentiel
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                Déjà client ? Se connecter <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://picsum.photos/seed/business/1200/800"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
