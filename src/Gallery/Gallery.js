import React, { Component } from 'react'
import ImageGallery from 'react-image-gallery'
import { Loader } from 'semantic-ui-react'
import './Gallery.css'

class Gallery extends Component {
  state = {
    images: [],
    page: 1,
    isFinishLoading: false,
  }

  constructor(props) {
    super(props)
    this.getImages = this.getImages.bind(this)
  }

  async getImages() {
    if (!this._isMounted || this.state.isFinishLoading) return
    let list;
    const imageRegex = /https?:\/\/[a-zA-Z0-9\.\/\-_]+(jpg|png|gif)/g
    try {
      list = await fetch(`https://lihkg.com/api_v1/thread/${ this.props.threadId }/page/${ this.state.page }`)
      list = await list.json()
      // Have to check mount state of this component since there are two async operations above
      if (!this._isMounted) return
      if (list.success) {
        const data = list.response.item_data
        const images = []
        data.forEach(c => {
          const commentImages = c.msg.match(imageRegex)
          if (commentImages && commentImages.length) {
            // TODO: use a set
            commentImages.forEach(image => {
              const key = image.replace('http://', '').replace('https://', '')
              if (!this.imageSet.has(key)) {
                images.push({
                  original: image,
                  thumbnail: image,
                })
                this.imageSet.add(key)
              }
            })
          }
        })
        this.setState({
          images: this.state.images.concat(images),
          page: this.state.page + 1,
        })
        this.getImages(this.state.page)
      } else {
        this.setState({ isFinishLoading: true })
      }
    } catch(e) {
      return;
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.imageSet = new Set()
    this.getImages(this.state.page)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    const loaderActive = this.state.images.length === 0
    const getLoadingText = () => {
      if (loaderActive) {
        if (!this.state.isFinishLoading) {
          return <Loader size='massive'>撈緊，等陣</Loader>
        } else {
          return <span className="noPictureText">冇圖 <img alt="dead" src={'https://lihkg.com/assets/faces/normal/dead.gif'}/></span>
        }
      }
      return null
    }
    const onClick = (event) => {
      if (event.target.src) {
        window.open(event.target.src)
      }
    }
    return (
      <div className="gallery">
        { getLoadingText() }
        <ImageGallery
          items={ this.state.images }
          infinite={ false }
          showPlayButton={ false }
          showIndex={ false }
          lazyLoad={ true }
          showFullscreenButton={ false }
          onClick={ onClick } />
      </div>
    );
  }
}

export default Gallery
