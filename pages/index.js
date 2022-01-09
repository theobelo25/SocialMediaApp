import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import CreatePost from '../components/Post/CreatePost';
import CardPost from '../components/Post/CardPost';
import { Segment } from 'semantic-ui-react';
import { parseCookies } from 'nookies';
import { NoPosts } from '../components/Layout/NoData';
import { PostDeleteToastr } from '../components/Layout/Toastr';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PlaceHolderPosts, EndMessage } from '../components/Layout/PlaceHolderGroup';
import cookie from 'js-cookie';

function Index({ user, postData, errorLoading }) {
    const [ posts, setPosts ] = useState(postData);
    const [ showToaster, setShowToaster ] = useState(false);
    const [ hasMore, setHasMore ] = useState(true);
    const [ pageNumber, setPageNumber ] = useState(2);

    useEffect(() => {document.title = `Welcome, ${user.name.split(' ')[0]}`}, []);

    useEffect(() => {
        showToaster && setTimeout(() => setShowToaster(false), 3000);
    }, [showToaster]);

    const fetchDataOnScroll = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/posts`, { 
                headers: { Authorization: cookie.get('token') },
                params: { pageNumber }
            });

            if (res.data.length === 0) setHasMore(false);

            setPosts(prev => [...prev, ...res.data]);
            setPageNumber(prev => prev + 1);
        } catch (error) {
            alert('Error fetching posts');
        }
    }; 

    return (
        <>
            {showToaster && <PostDeleteToastr />}
            <Segment>
                <CreatePost user={user} setPosts={setPosts} />
                {(posts.length === 0 || errorLoading) ? (
                    <NoPosts />
                ) : (
                    <InfiniteScroll 
                        hasMore={hasMore} 
                        next={fetchDataOnScroll} 
                        loader={<PlaceHolderPosts />}
                        endMessage={<EndMessage />}
                        dataLength={posts.length}
                    >
                        {posts.map(post => ( 
                            <CardPost 
                                key={post._id} 
                                post={post} 
                                user={user} 
                                setPosts={setPosts}
                                setShowToaster={setShowToaster}
                            />
                        ))}
                    </InfiniteScroll>
                )}
            </Segment>
        </>
    );
};

Index.getInitialProps = async (ctx) => {
    try {
        const {token} = parseCookies(ctx);

        const res = await axios.get(`${baseUrl}/api/posts`, { 
            headers: { Authorization: token },
            params: { pageNumber: 1 }
        });

        return { postData: res.data };
    } catch (error) {
        return { errorLoading: true };
    }
};

export default Index;