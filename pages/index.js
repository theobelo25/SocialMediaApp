import axios from 'axios';
import React from 'react';

function Index({ user, userFollowStats }) {
    console.log(user, userFollowStats);
    return <div>
        Homepage
    </div>
};

Index.getInitialProps = async ctx => {
    try {
        const res = await axios.get('https://jsonplaceholder.typicode.com/posts');
        
        return { posts: res.data}
        
    } catch (error) {
        return { errorLoading: true }
    }
};
export default Index;