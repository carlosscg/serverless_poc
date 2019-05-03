import Auth from '@aws-amplify/auth';
import Analytics from '@aws-amplify/analytics';

import React from 'react';
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";

import awsconfig from './aws-exports';

/* Amplify GraphQL Client*/
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import * as subscriptions from './graphql/subscriptions';

/* Amplify Configuration */
Amplify.configure(awsconfig);

/*Using a GraphQL Server */
Amplify.configure({
    API: {
        graphql_endpoint: awsconfig.aws_appsync_graphqlEndpoint,
        graphql_headers: async() => ({
            'graphql-header': 'Encabezado graphql'
        }),
        graphql_endpoint_iam_region: awsconfig.aws_appsync_region
    }
})


// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);
// send analytics events to Amazon Pinpoint
Analytics.configure(awsconfig);

/*
// Simple query
const allTodos = await API.graphql(graphqlOperation(queries.listTodos));
console.log(allTodos);

// Query using a parameter
const oneTodo = await API.graphql(graphqlOperation(queries.getTodo, { id: 'some id' }));
console.log(oneTodo);

// Mutation
const todoDetails = {
    name: 'Todo 1',
    description: 'Learn AWS AppSync'
};

const newTodo = await API.graphql(graphqlOperation(mutations.createTodo, {input: todoDetails}));
console.log(newTodo);

// Subscribe to creation of Todo
const subscription = API.graphql(
    graphqlOperation(subscriptions.onCreateTodo)
).subscribe({
    next: (todoData) => console.log(todoData)
});

// Stop receiving data updates from the subscription
subscription.unsubscribe();*/

const AnalyticsResult = document.getElementById('AnalyticsResult');
const AnalyticsEventButton = document.getElementById('AnalyticsEventButton');
let EventsSent = 0;
AnalyticsEventButton.addEventListener('click', (evt) => {
    Analytics.record('Amplify Tutorial Event')
        .then( (evt) => {
            const url = 'https://'+awsconfig.aws_mobile_analytics_app_region+'.console.aws.amazon.com/pinpoint/home/?region='+awsconfig.aws_mobile_analytics_app_region+'#/apps/'+awsconfig.aws_mobile_analytics_app_id+'/analytics/events';
            AnalyticsResult.innerHTML = '<p>Event Submitted.</p>';
            AnalyticsResult.innerHTML += '<p>Events sent: '+(++EventsSent)+'</p>';
            AnalyticsResult.innerHTML += '<a href="'+url+'" target="_blank">View Events on the Amazon Pinpoint Console</a>';
        });
});

class AddTodo extends Component {
    constructor(props) {
      super(props);
      this.state = {
          name: '',
          description: '',
      };
    }
  
    handleChange(name, ev) {
        this.setState({ [name]: ev.target.value });
    }
  
    async submit() {
      const { onCreate } = this.props;
      var input = {
        name: this.state.name,
        description: this.state.description
      }
      console.log(input);
      await onCreate({input})
    }
  
    render(){
      return (
          <div>
              <input
                  name="name"
                  placeholder="name"
                  onChange={(ev) => { this.handleChange('name', ev)}}
              />
              <input
                  name="description"
                  placeholder="description"
                  onChange={(ev) => { this.handleChange('description', ev)}}
              />
              <button onClick={this.submit.bind(this)}>
                  Add
              </button>
          </div>
      );
    }
  }

class App extends React.Component {

    render() {

        const ListView = ({ todos }) => (
            <div>
                <h3>All Todos</h3>
                <ul>
                    {todos.map(todo => <li key={todo.id}>{todo.name} ({todo.id})</li>)}
                </ul>
            </div>
        );

        return (
            <div className="App">
                <Connect mutation={graphqlOperation(mutations.createTodo)}>
                {({mutation}) => (
                    <AddTodo onCreate={mutation} />
                )}
                </Connect>

                <Connect query={graphqlOperation(queries.listTodos)}
                subscription={graphqlOperation(subscriptions.onCreateTodo)}
                onSubscriptionMsg={(prev, {onCreateTodo}) => {
                    console.log('Subscription data:', onCreateTodo)
                    return prev;
                    }
                }>
                {({ data: { listTodos }, loading, error }) => {
                if (error) return <h3>Error</h3>;
                if (loading || !listTodos) return <h3>Loading...</h3>;
                    return (<ListView todos={listTodos.items} />);
                }}
                </Connect>
            </div>
        );
    }
} 

export default App;

