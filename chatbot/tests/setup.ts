import '@testing-library/jest-dom'

// jsdomにないメソッドをモック
Element.prototype.scrollIntoView = () => {}
