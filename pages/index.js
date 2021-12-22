import axios from 'axios';
import React, { useEffect } from 'react';

function Index({ user, userFollowStats }) {
    useEffect(() => {document.title = `Welcome, ${user.name.split(' ')[0]}`}, []);
    return <div>Homepage</div>
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