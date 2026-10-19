
document.querySelectorAll('.cat-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.cat-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    this.classList.add('active');
  });
});