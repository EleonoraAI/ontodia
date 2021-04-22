import { createElement, ClassAttributes } from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import {
    Workspace, WorkspaceProps, SparqlDataProvider, OWLStatsSettings, SparqlQueryMethod, GroupTemplate, LinkTypeIri
} from '../index';
import { rootReducer } from '../ontodia/store/rootReducer';
import ConnectedWorkspace from '../ontodia/workspace/workspace';

import { onPageLoad, tryLoadLayoutFromLocalStorage, saveLayoutToLocalStorage } from './common';

function onWorkspaceMounted(workspace: Workspace) {
    if (!workspace) { return; }

    const diagram = tryLoadLayoutFromLocalStorage();
    workspace.getModel().importLayout({
        diagram: {
            ...diagram,
            linkTypeOptions: [
                {
                    '@type': 'LinkTypeOptions',
                    property: 'http://www.researchspace.org/ontology/group' as LinkTypeIri,
                    visible: false,
                },
            ],
        },
        
        validateLinks: true,
        dataProvider: new SparqlDataProvider({
            endpointUrl: 'http://localhost:9999/blazegraph/namespace/kb/sparql',
            imagePropertyUris: [
                'http://collection.britishmuseum.org/id/ontology/PX_has_main_representation',
                'http://xmlns.com/foaf/0.1/img',
            ],
            queryMethod: SparqlQueryMethod.GET,
            acceptBlankNodes: true,
        }, OWLStatsSettings),
    });
}

const props: WorkspaceProps & ClassAttributes<Workspace> = {
    ref: onWorkspaceMounted,
    onSaveDiagram: workspace => {
        const diagram = workspace.getModel().exportLayout();
        window.location.hash = saveLayoutToLocalStorage(diagram);
        window.location.reload();
    },
    viewOptions: {
        onIriClick: ({iri}) => window.open(iri),
        groupBy: [
            {linkType: 'http://www.researchspace.org/ontology/group', linkDirection: 'in'},
        ],
    },
    languages: [
        {code: 'en', label: 'English'},
        {code: 'it', label: 'Italian'},
        {code: 'ru', label: 'Russian'},
    ],
    language: 'it',
    // elementTemplateResolver: types => {
    //     if (types.indexOf('http://www.w3.org/1999/02/22-rdf-syntax-ns#type') !== -1) {
    //         return GroupTemplate;
    //     }
    //     return undefined;
    // },
};

const store = createStore(rootReducer);

onPageLoad((container) => ReactDOM.render(
    createElement(Provider, { store: store },
        createElement(ConnectedWorkspace, props),
    ), container));

